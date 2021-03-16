<?php

namespace App\Http\Controllers;

use App\Image;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Services\S3\S3Facade;
use App\Services\S3\FileTypeNotAllowedException;

class GalleryController extends Controller
{
    private $s3;

    private $extensions = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
    ];

    public function __construct(S3Facade $s3)
    {
        $this->s3 = $s3;
    }

    public function index(Request $request)
    {
        $query = Image::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        $limit = 100;
        if ($request->has('limit')) {
            $limit = $request->get('limit');
        }
        $query->take($limit);

        $images = $query->get();

        return response()->json($images, 200);
    }

    public function store(Request $request)
    {
        $input = $request->validate([
            'filename' => 'required|string',
            'title' => 'required|string',
            'description' => 'required|string',
        ]);

        $ext = pathinfo($input['filename'], PATHINFO_EXTENSION);

        if (!array_key_exists($ext, $this->extensions)) {
            throw new FileTypeNotAllowedException('File type not allowed.');
        }

        $filename = time() . '_' . $request->user()->id . '_' . Str::random(10);
        $key = "gallery/user_{$request->user()->id}/{$filename}";
        $contentType = $this->extensions[$ext];

        // Get pre-signed POST params.
        $post = $this->s3->getPresignedPostParams($key, $contentType);

        // Store metadata in database.
        $image = Image::create([
            'user_id' => $request->user()->id,
            'name' => $filename,
            'title' => $input['title'],
            'description' => $input['description'],
        ]);

        return [
            'image' => $image,
            'url' => $post['url'],
            'params' => $post['params'],
        ];
    }

    public function destroy(Request $request, Image $image)
    {
        $key = "gallery/user_{$request->user()->id}/{$image->name}";
        $this->s3->deleteFile($key);

        $image->delete();

        return response()->json(null, 200);
    }
}
