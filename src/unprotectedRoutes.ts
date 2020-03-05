
import { SwaggerRouter } from 'koa-swagger-decorator';
import controller = require('./controller');

const unprotectedRouter  = new SwaggerRouter();

// USER ROUTES
unprotectedRouter.get('/dog-api', controller.breed.getAll);
unprotectedRouter.get('/dog-api/view/:breed', controller.breed.getViewBreed);
unprotectedRouter.get('/dog-api/view/:breed/:subbreed', controller.breed.getViewSubBreed);
unprotectedRouter.get('/dog-api/:breed', controller.breed.getBreed);
unprotectedRouter.get('/dog-api/:breed/:subbreed', controller.breed.getSubBreed);

// Swagger endpoint
unprotectedRouter.swagger({
    title: 'node-typescript-koa-rest',
    description: 'API REST using NodeJS and KOA framework, typescript. TypeORM for SQL with class-validators. Middlewares JWT, CORS, Winston Logger.',
    version: '1.5.0'
});

// mapDir will scan the input dir, and automatically call router.map to all Router Class
unprotectedRouter.mapDir(__dirname);

export { unprotectedRouter };
