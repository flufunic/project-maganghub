<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>MMS - Maintenance Management System</title>

    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png">

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])

    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>