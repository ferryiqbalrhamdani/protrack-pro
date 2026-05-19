<?php
$c = app(App\Http\Controllers\ProjectController::class);
$reflector = new \ReflectionObject($c);
$method = $reflector->getMethod('getFormattedProject');
$method->setAccessible(true);
$project = App\Models\Project::with('merchandiser')->first();
$res = $method->invokeArgs($c, [$project, \App\Support\Hashid::encode($project->id)]);
echo json_encode($res['relations']['merchandiser']);
