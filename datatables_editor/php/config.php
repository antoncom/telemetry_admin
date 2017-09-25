<?php if (!defined('DATATABLES')) exit(); // Ensure being used in DataTables env.

// Enable error reporting for debugging (remove for production)
error_reporting(E_ALL);
ini_set('display_errors', '1');


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Database user / pass
 */

if($_SERVER['HTTP_HOST']=='localhost'  ||  $_SERVER['HTTP_HOST']=='home.dev') {
	// Local server settings
	$sql_details = array(
		"type" => "Mysql",   // Database type: "Mysql", "Postgres", "Sqlserver", "Sqlite" or "Oracle"
		"user" => "root",        // Database user name
		"pass" => "",        // Database password
		"host" => "localhost",        // Database host
		"port" => "",        // Database connection port (can be left empty for default)
		"db" => "datatables_demo",        // Database name
		"dsn" => "charset=utf8",        // PHP DSN extra information. Set as `charset=utf8` if you are using MySQL
		"pdoAttr" => array() // PHP PDO attributes array. See the PHP documentation for all options
	);
}
else{
	// Remote server settings
	$sql_details = array(
		"type" => "Mysql",   // Database type: "Mysql", "Postgres", "Sqlserver", "Sqlite" or "Oracle"
		"user" => "mediapub_mysql",        // Database user name
		"pass" => "akssr2uo",        // Database password
		"host" => "mediapub.mysql",        // Database host
		"port" => "",        // Database connection port (can be left empty for default)
		"db"   => "mediapub_telenergo",        // Database name
		"dsn"  => "charset=utf8",        // PHP DSN extra information. Set as `charset=utf8` if you are using MySQL
		"pdoAttr" => array() // PHP PDO attributes array. See the PHP documentation for all options
	);
}


