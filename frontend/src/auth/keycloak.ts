import Keycloak from 'keycloak-js';


const keycloak = new Keycloak({

    url: 'http://localhost:8082',

    realm: 'store',

    clientId: 'store-frontend'

});


export default keycloak;