
export default class HTTPWrapper {
  static fetchURL( url, callback ) {
    fetch( url )
    .then( 
      ( response ) => {
        callback( response );
      },
      ( error ) => {
        console.log( error );
      }
    )
  }
  
  static fetchImagesUrls( callback ) {
    
  }
  
  static fetchObj( callback ) {
    
  }
}
