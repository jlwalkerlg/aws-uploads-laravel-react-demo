<?php

namespace App\Http\Controllers;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Services\S3\S3Facade;
use App\Http\Controllers\Controller;
use App\Services\S3\FileTypeNotAllowedException;
use App\Video;

class VideosController extends Controller
{
    private $s3;

    private $extensions = [
        'mp4' => 'video/mp4',
    ];

    public function __construct(S3Facade $s3)
    {
        $this->s3 = $s3;
    }

    public function index(Request $request)
    {
        $query = Video::query();

        if ($request->has('user_id')) {
            $query->where('user_id', $request->get('user_id'));
        }

        $limit = 100;
        if ($request->has('limit')) {
            $limit = $request->get('limit');
        }
        $query->take($limit);

        $videos = $query->get();

        return response()->json($videos, 200);
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
        $key = "videos/user_{$request->user()->id}/{$filename}";
        $contentType = $this->extensions[$ext];

        // Get pre-signed POST params.
        $options = [
            'minSize' => 1,
            'maxSize' => 524288000,
        ];
        $post = $this->s3->getPresignedPostParams($key, $contentType, $options);

        // Store metadata in database.
        $video = Video::create([
            'user_id' => $request->user()->id,
            'name' => $filename,
            'type' => $contentType,
            'title' => $input['title'],
            'description' => $input['description'],
        ]);

        return [
            'video' => $video,
            'url' => $post['url'],
            'params' => $post['params'],
        ];
    }

    public function destroy(Request $request, Video $video)
    {
        $key = "videos/user_{$request->user()->id}/{$video->name}";
        $this->s3->deleteFile($key);

        $video->delete();

        return response()->json(null, 200);
    }
}
