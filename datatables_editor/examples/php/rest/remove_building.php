<?php

/*
 * Example PHP implementation used for the REST 'create' interface.
 */

include( "building-rest.php" );

$editor
	->process( $_GET )
	->json();

