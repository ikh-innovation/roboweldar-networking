const chalk = require( 'chalk' );

function warn( msg ) {
  console.log( chalk.yellow( msg ) );
}

function err( msg ) {
  console.log( chalk.red( msg ) );
}

function debug( msg ) {
  console.log( chalk.orange( msg ) );
}

function success( msg ) {
  console.log( chalk.green( msg ) );
}

module.exports = { 
  warn: warn,
  err: err,
  debug: debug,
  success: success
};
