<?php

namespace App\Services\S3;

use App\User;

class S3Facade
{
    private $s3;
    private $bucket;

    public function __construct()
    {
        $sdk = new \Aws\Sdk([
            'version' => 'latest',
            'region' => getenv('AWS_DEFAULT_REGION'),
        ]);
        $this->s3 = $sdk->createS3();

        $this->bucket = getenv('AWS_BUCKET');
    }

    public function getPresignedPostParams(string $key, string $contentType, array $options = [])
    {
        $uuid = uniqid();

        // Set some defaults for form input fields
        $formInputs = [
            'key' => $key,
            'acl' => 'public-read',
            'success_action_status' => '201',
            'Content-Type' => $contentType,
            'x-amz-meta-uuid' => $uuid,
        ];

        // Construct an array of conditions for policy
        $conditions = [
            ['bucket' => $this->bucket],
            ['key' => $key],
            ['acl' => 'public-read'],
            ['success_action_status' => '201'],
            ['Content-Type' => $contentType],
            ['x-amz-meta-uuid' => $uuid],
            ['starts-with', '$x-amz-meta-tag', ''],
            ['content-length-range', $options['minSize'] ?? 1, $options['maxSize'] ?? 10485760], // 1B to 10MB
        ];

        // Optional: configure expiration time string
        $expires = '+5 minutes';

        // Create a post object to represent the pre-signed post.
        $postObject = new \Aws\S3\PostObjectV4(
            $this->s3,
            $this->bucket,
            $formInputs,
            $conditions,
            $expires
        );

        // Get attributes to set on an HTML form, e.g., action, method, enctype
        $formAttributes = $postObject->getFormAttributes();

        // Get form input fields. This will include anything set as a form input in
        // the constructor, the provided JSON policy, your AWS access key ID, and an
        // auth signature.
        $formInputs = $postObject->getFormInputs();

        return [
            'url' => $formAttributes['action'],
            'params' => $formInputs,
        ];
    }

    public function deleteFile(string $key)
    {
        $this->s3->deleteObject([
            'Bucket' => $this->bucket,
            'Key'    => $key,
        ]);
    }
}
