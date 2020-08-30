import chalk from 'chalk';

export function warn( msg ) {
  console.log( chalk.yellow( msg ) );
}

export function err( msg ) {
  console.log( chalk.red( msg ) );
}

export function debug( msg ) {
  console.log( chalk.orange( msg ) );
}

export function success( msg ) {
  console.log( chalk.green( msg ) );
}
