<?php

/*
 * Example PHP implementation used for the REST example.
 * This file defines a DTEditor class instance which can then be used, as
 * required, by the CRUD actions.
 */

// DataTables PHP library
include( dirname(__FILE__)."/../../../php/DataTables.php" );

// Alias Editor classes so they are easy to use
use
	DataTables\Editor,
	DataTables\Editor\Field,
	DataTables\Editor\Format,
	DataTables\Editor\Mjoin,
	DataTables\Editor\Validate;

// Build our Editor instance and process the data coming from _POST
$editor = Editor::inst( $db, 'tariff' )
	->fields(
		Field::inst( 'resource' )->validator( 'Validate::notEmpty' ),
		Field::inst( 'tariff_name' )->validator( 'Validate::notEmpty' ),
		Field::inst( 'measure' )->validator( 'Validate::notEmpty' ),
		Field::inst( 'value' )->validator( 'Validate::numeric' )
	);
