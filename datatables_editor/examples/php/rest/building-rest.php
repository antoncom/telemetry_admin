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
$editor = Editor::inst( $db, 'building' )
	->fields(
		Field::inst( 'building_address' )->validator( 'Validate::notEmpty' ),
		Field::inst( 'apartaments_number' )
			->validator( 'Validate::numeric' )
			->getFormatter( function ( $val ) {
				return number_format($val);
			} )
			->setFormatter( 'Format::ifEmpty', null ),
		Field::inst( 'non_live_number' )
			->validator( 'Validate::numeric' )
			->getFormatter( function ( $val ) {
				return number_format($val);
			} )
			->setFormatter( 'Format::ifEmpty', null ),
		Field::inst( 'equipmens_number' )
			->validator( 'Validate::numeric' )
			->getFormatter( function ( $val ) {
				return number_format($val);
			} )
			->setFormatter( 'Format::ifEmpty', null ),
		Field::inst( 'ODU_counters_number' )
			->validator( 'Validate::numeric' )
			->getFormatter( function ( $val ) {
				return number_format($val);
			} )
			->setFormatter( 'Format::ifEmpty', null )
	);
