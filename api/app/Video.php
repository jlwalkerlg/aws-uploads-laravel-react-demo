<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'name', 'type', 'title', 'description',
    ];

    protected $appends = [
        'url'
    ];

    public function getUrlAttribute()
    {
        $domain = getenv('AWS_CLOUDFRONT_DOMAIN_NAME');
        return "https://{$domain}/videos/user_{$this->user_id}/{$this->name}";
    }
}
