<?php

// DataTables PHP library
include( "../../php/DataTables.php" );

ini_set("log_errors", 1);
ini_set("error_log", "/php-error.log");
error_log( "Hello, errors!" );

// Alias Editor classes so they are easy to use
use
	DataTables\Editor,
	DataTables\Editor\Field,
	DataTables\Editor\Format,
	DataTables\Editor\Mjoin,
	DataTables\Editor\Options,
	DataTables\Editor\Upload,
	DataTables\Editor\Validate;


/*
 * Example PHP implementation used for the join.html example
 */
Editor::inst( $db, 'build_address' )
	->field(
		Field::inst( 'build_address.build_address' ),
		Field::inst( 'build_address.id' )
	)
	->join(
		Mjoin::inst( 'apartment' )
			->link( 'build_address.id', 'apartment.build_address_id' )
			->fields(
				Field::inst( 'id' ),
				Field::inst( 'flat_type' )
			)
	)
	->process($_POST)
	->json();
