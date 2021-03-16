<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'name', 'title', 'description',
    ];

    protected $appends = [
        'url'
    ];

    public function getUrlAttribute()
    {
        $domain = getenv('AWS_CLOUDFRONT_DOMAIN_NAME');
        return "https://{$domain}/gallery/user_{$this->user_id}/{$this->name}";
    }
}
