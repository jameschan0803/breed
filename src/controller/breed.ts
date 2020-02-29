import { BaseContext } from 'koa';
//import { getManager, Repository, Not, Equal, Like } from 'typeorm';
import { validate, ValidationError } from 'class-validator';
import { request, summary, path, body, responsesAll, tagsAll } from 'koa-swagger-decorator';

const rp = require('../lib/request-promise')

class ResObj {
    public success: boolean = false
    public message: string = ""
    public data: any[]
    public page: number = 0
    public perpage: number = 0
    public total: number = 0
}

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
        console.log("search all")
        let rRes = new ResObj();
        var options = {
            body: {},
            method: 'GET',
            uri: "https://dog.ceo/api/breeds/list/all",
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        try {
            let res = await rp(options)

            if (res.status == "success") {

                rRes.success = true
                ctx.status = 200

                var dogs = res.message
                var arr = [];
                let Obj: {
                    breed: string,
                    subbreed?: string | undefined
                }

                for (let breed of Object.keys(dogs)) {
                    var subs = dogs[breed]
                    //console.log(breed, subs)
                    if (subs.length == 0) {
                        Obj = {
                            "breed": breed,
                            "subbreed": undefined
                        }
                        arr.push(Obj)
                    } else {
                        for (let sub of subs) {
                            Obj = {
                                "breed": breed,
                                "subbreed": sub
                            }
                            arr.push(Obj)
                        }
                    }
                }

                rRes.data = arr
            } else {
                rRes.message  = `sry, we donot have any picutures.`
            }

        } catch (err) {
            ctx.status = 404;
            var info = err.message;
            if (!info) info = "no data is available currently"
            rRes.message = info
        }

        ctx.body = rRes

    }


    @request('get', '/{breed}')
    @summary('Find breed by name')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' },
        page: { type: 'string', required: false, description: 'return which page,default is 0' },
        perpage: { type: 'string', required: false, description: 'define how many items in one page, less than 200, default is 10' }
    })
    public static async getBreed(ctx: BaseContext) {


        // get breed by name
        const breedname = ctx.params.breed || "";
        const page = ctx.query.page || 0;
        const perpage = ctx.query.perpage || 10;

        console.log("search breedname:", breedname, page, perpage)

        let rRes = new ResObj();

        if (perpage > 200 || perpage < 0) {
            rRes.message =  " perpage is over 200 limitation or less than 0"
            ctx.body = rRes
            return;
        }

        if (page < 0) {
            rRes.message = " page is less than 0"
            ctx.body = rRes
            return;
        }

        var options = {
            body: {},
            method: 'GET',
            uri: 'https://dog.ceo/api/breed/' + breedname + '/images',
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        try {
            let res = await rp(options);

            ctx.status = 200;
            rRes.success = true

            if (res.status == "success") {
                var total = res.message.length
                console.log(`return ${total} records`)

                rRes.page = +page
                rRes.perpage = +perpage
                rRes.total= +total

                var selectPage = page * perpage

                if (selectPage > total) {
                    ctx.status = 200;
                    rRes.success = false
                    rRes.message =  `the selected page is over total number ${total}`;
                    ctx.body = rRes
                    return;
                }

                var end = +selectPage + +perpage
                end = end > total ? total : end;
                rRes.data = res.message.slice(selectPage, end);

                //console.log(start, end, breed.data.length)

            } else {
                rRes.message  = `sry, we donot have any picutures.`
            }

        } catch (err) {
            ctx.status = 404;
            var info
            if (err.error.message ) info = err.error.message;
            if (!info) info = "no data is available currently"
            rRes.message = info
        }

        ctx.body = rRes

    }

    @request('get', '/{breed}/{subbreed}')
    @summary('Find subbreed under breed by name')
    @path({
        breed: { type: 'string', required: true, description: 'name of breed' },
        subbreed: { type: 'string', required: false, description: 'name of subbreed' },
        page: { type: 'number', required: false, description: 'return which page,default is 0' },
        perpage: { type: 'number', required: false, description: 'define how many items in one page, less than 200, default is 10' }
    })

    public static async getSubBreed(ctx: BaseContext) {

        // get subbreed by name
        const breedname = ctx.params.breed || "";
        const subbreedname = ctx.params.subbreed || "";
        const page = ctx.query.page || 0;
        const perpage = ctx.query.perpage || 10;

        console.log("search subbreed:", breedname, subbreedname, page, perpage)

        let rRes = new ResObj();
        ctx.body = 400

        if (perpage > 200 || perpage < 0) {
            rRes.message = " perpage is over 200 limitation or less than 0"
            ctx.body = rRes
            return;
        }

        if (page < 0) {
            rRes.message = " page is less than 0"
            ctx.body = rRes
            return;
        }

        var options = {
            body: {},
            method: 'GET',
            uri: 'https://dog.ceo/api/breed/' + breedname + "/" + subbreedname + '/images',
            json: true,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        try {
            let res = await rp(options);
            ctx.status = 200;
            rRes.success = true

            if (res.status == "success") {
                var total = res.message.length
                console.log(`return ${total} records`)

                rRes.page = +page
                rRes.perpage = +perpage
                rRes.total= +total

                var selectPage = page * perpage

                if (selectPage > total) {
                    ctx.status = 200;
                    rRes.success = false
                    rRes.message =  `the selected page is over total number ${total}`;
                    ctx.body = rRes
                    return;
                }

                var end = +selectPage + +perpage
                end = end > total ? total : end;
                rRes.data = res.message.slice(selectPage, end);


            } else {
                rRes.message  = `sry, we donot have any picutures.`
            }

        } catch (err) {
            ctx.status = 404;
            var info
            if (err.error.message ) info = err.error.message;
            if (!info) info = "no data is available currently"
            rRes.message = info
        }

        ctx.body = rRes

    }

}
