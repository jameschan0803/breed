import { BaseContext } from 'koa';
// import { getManager, Repository, Not, Equal, Like } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import {
    request,
    summary,
    path,
    body,
    responsesAll,
    tagsAll
} from 'koa-swagger-decorator';

import rp from '../lib/request-promise';

class ResObj {
    public success: boolean = false;
    public message: string = '';
    public data: any[];
    public page: number = 0;
    public perpage: number = 0;
    public total: number = 0;
}

const MAX_PAGE_NUMBER: Number = 200;

@responsesAll({
    200: { description: 'success' },
    400: { description: 'bad request' },
    401: { description: 'unauthorized, missing/wrong jwt token' }
})
@tagsAll(['Breed'])
export default class BreedController {
    @request('get', '/')
    @summary('Find all breeds and subbreeds')
    public static async getAll(ctx: BaseContext) {
        console.log('search all');
        const rRes = new ResObj();
        const options = {
            body: {},
            method: 'GET',
            uri: 'https://dog.ceo/api/breeds/list/all',
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await rp(options);

            if (res.status == 'success') {
                rRes.success = true;
                ctx.status = 200;

                const dogs = res.message;
                const arr = [];
                let Obj: {
                    breed: string;
                    subbreed?: string | undefined;
                };

                for (const breed of Object.keys(dogs)) {
                    const subs = dogs[breed];
                    // console.log(breed, subs)
                    if (subs.length == 0) {
                        Obj = {
                            breed: breed,
                            subbreed: undefined
                        };
                        arr.push(Obj);
                    } else {
                        for (const sub of subs) {
                            Obj = {
                                breed: breed,
                                subbreed: sub
                            };
                            arr.push(Obj);
                        }
                    }
                }

                rRes.data = arr;
            } else {
                rRes.message = `sry, we donot have any picutures.`;
            }
        } catch (err) {
            ctx.status = 404;
            let info = err.message;
            if (!info) info = 'no data is available currently';
            rRes.message = info;
        }

        ctx.body = rRes;
    }

    @request('get', '/{breed}')
    @summary('Find breed by name')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' },
        page: {
            type: 'string',
            required: false,
            description: 'return which page,default is 0'
        },
        perpage: {
            type: 'string',
            required: false,
            description:
                'define how many items in one page, less than 200, default is 10'
        }
    })
    public static async getBreed(ctx: BaseContext) {
        // get breed by name
        const breedname: string = ctx.params.breed || '';
        const page: number = ctx.query.page || 0;
        const perpage: number = ctx.query.perpage || MAX_PAGE_NUMBER;

        console.log('search breedname:', breedname, page, perpage);

        const rRes = new ResObj();

        if (perpage > MAX_PAGE_NUMBER || perpage < 0) {
            rRes.message =
                ' perpage is over ${MAX_PAGE_NUMBER} limitation or less than 0';
            ctx.body = rRes;
            return;
        }

        if (page < 0) {
            rRes.message = ' page is less than 0';
            ctx.body = rRes;
            return;
        }

        const options = {
            body: {},
            method: 'GET',
            uri: 'https://dog.ceo/api/breed/' + breedname + '/images',
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            const res = await rp(options);

            // console.log('res:', res);

            ctx.status = 200;
            rRes.success = true;

            if (res.status == 'success') {
                const total: number = res.message.length;
                console.log(`return ${total} records`);

                rRes.page = +page;
                rRes.perpage = +perpage;
                rRes.total = total;

                const selectPage: number = page * perpage;

                if (selectPage > total) {
                    ctx.status = 200;
                    rRes.success = false;
                    rRes.message = `the selected page is over total number ${total}`;
                    ctx.body = rRes;
                    return;
                }

                let end: number = +selectPage + +perpage;
                end = end > total ? total : end;
                // console.log(selectPage, end);
                if (selectPage > 0) rRes.data = res.message.slice(selectPage, end);
                else rRes.data = res.message;

                // console.log(start, end, breed.data.length)
            } else {
                rRes.message = `sry, we donot have any picutures.`;
            }
        } catch (err) {
            ctx.status = 404;
            let info: string;
            if (err.error.message) info = err.error.message;
            if (!info) info = 'no data is available currently';
            rRes.message = info;
        }

        ctx.body = rRes;
    }

    @request('get', '/{breed}/{subbreed}')
    @summary('Find subbreed under breed by name')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' },
        subbreed: {
            type: 'string',
            required: false,
            description: 'name of subbreed'
        },
        page: {
            type: 'number',
            required: false,
            description: 'return which page,default is 0'
        },
        perpage: {
            type: 'number',
            required: false,
            description:
                'define how many items in one page, less than 200, default is 10'
        }
    })
    public static async getSubBreed(ctx: BaseContext) {
        // get subbreed by name
        const breedname: string = ctx.params.breed || '';
        const subbreedname: string = ctx.params.subbreed || '';
        const page: number = ctx.query.page || 0;
        const perpage: number = ctx.query.perpage || MAX_PAGE_NUMBER;

        console.log('search subbreed:', breedname, subbreedname, page, perpage);

        const rRes = new ResObj();
        ctx.body = 400;

        if (perpage > MAX_PAGE_NUMBER || perpage < 0) {
            rRes.message =
                ' perpage is over ${MAX_PAGE_NUMBER} limitation or less than 0';
            ctx.body = rRes;
            return;
        }

        if (page < 0) {
            rRes.message = ' page is less than 0';
            ctx.body = rRes;
            return;
        }

        const options = {
            body: {},
            method: 'GET',
            uri:
                'https://dog.ceo/api/breed/' +
                breedname +
                '/' +
                subbreedname +
                '/images',
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try {
            const res = await rp(options);
            ctx.status = 200;
            rRes.success = true;

            if (res.status == 'success') {
                const total: number = res.message.length;
                // console.log(`return ${total} records`);

                rRes.page = +page;
                rRes.perpage = +perpage;
                rRes.total = +total;

                const selectPage = page * perpage;

                if (selectPage > total) {
                    ctx.status = 200;
                    rRes.success = false;
                    rRes.message = `the selected page is over total number ${total}`;
                    ctx.body = rRes;
                    return;
                }

                let end = +selectPage + +perpage;
                end = end > total ? total : end;
                if (selectPage > 0) rRes.data = res.message.slice(selectPage, end);
                else rRes.data = res.message;
            } else {
                rRes.message = `sry, we donot have any picutures.`;
            }
        } catch (err) {
            ctx.status = 404;
            let info: string;
            if (err.error.message) info = err.error.message;
            if (!info) info = 'no data is available currently';
            rRes.message = info;
        }

        ctx.body = rRes;
    }

    @request('get', '/view/{breed}')
    @summary('Find breed one random pic')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' }
    })
    public static async getViewBreed(ctx: BaseContext) {
       
        // get breed by name
        const breedname: string = ctx.params.breed || '';

        console.log('search breed:', breedname);

        const url = 'https://dog.ceo/api/breed/' + breedname + '/images/random';

        //console.log("RL",url)

        const result = await handle(url);

        if (result.success) ctx.status = 200;
        else ctx.status = 404;

        ctx.body = result;
    }

    @request('get', '/view/{breed}/{subbreed}')
    @summary('Find sub breed one random pic')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' },
        subbreed: {
            type: 'string',
            required: true,
            description: 'name of subbreed'
        }
    })
    public static async getViewSubBreed(ctx: BaseContext) {
        // get subbreed by name
        const breedname: string = ctx.params.breed || '';
        const subbreedname: string = ctx.params.subbreed || '';

        console.log('search1 subbreed:', breedname, '@', subbreedname);

        const url = 'https://dog.ceo/api/breed/' +
            breedname +
            '/' +
            subbreedname +
            '/images/random';

        const result = await handle(url);

        if (result.success) ctx.status = 200;
        else ctx.status = 404;

        ctx.body = result;
    } 
}

async function handle(url) {

    const options = {
        body: {},
        method: 'GET',
        uri: url,
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const rRes = new ResObj();
    try {
        const res = await rp(options);
        rRes.success = true;
        if (res.status == 'success') {
            console.log('single pic url:', res.message);
            rRes.data = res.message;
        } else {
            rRes.message = `sry, we donot have any picutures.`;
        }
    } catch (err) {
        let info: string;
        if (err.error.message) info = err.error.message;
        if (!info) info = 'no data is available currently';
        rRes.message = info;

    }
    return rRes;
}
