<?php

return [
    /*
    | Secret salt used to hash visitor IP addresses. We never store raw IPs;
    | only a salted SHA-256 hash so visits can be de-duplicated/counted while
    | staying anonymous. Change this value in production.
    */
    'ip_salt' => env('ANALYTICS_IP_SALT', 'harinjaka-default-salt'),

    /*
    | Whether to resolve IPs to a coarse location via ip-api.com.
    | Disabled by default to avoid any outbound network call.
    */
    'geo_lookup_enabled' => env('GEO_LOOKUP_ENABLED', false),
];
