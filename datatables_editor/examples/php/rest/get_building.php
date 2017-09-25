<?php

/*
 * Example PHP implementation used for the REST 'get' interface
 */

include( "building-rest.php" );

$editor
	->process($_POST)
	->json();

