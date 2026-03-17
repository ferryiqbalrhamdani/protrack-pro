<?php

namespace App\Support;

use Hashids\Hashids;

class Hashid
{
    private static $hashids;

    private static function init()
    {
        if (!self::$hashids) {
            self::$hashids = new Hashids(config('app.key'), 10);
        }
    }

    public static function encode($id)
    {
        self::init();
        return self::$hashids->encode($id);
    }

    public static function decode($hash)
    {
        self::init();
        $result = self::$hashids->decode($hash);
        return count($result) > 0 ? $result[0] : null;
    }
}
