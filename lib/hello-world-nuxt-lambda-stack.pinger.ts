import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {

    console.log(event, context);

    if (process.env.NUXT_APP_URL === undefined) {
        console.log('No NUXT_APP_URL defined, quitting');
        return;
    }

    const stringUrl: string = process.env.NUXT_APP_URL;

    console.log(`Pinger lambda is going to ping ${stringUrl}`);
    console.time('[Cold start]');
    await fetch(stringUrl).then((response) => {
        console.timeEnd('[Cold start]');
        console.log(response);
    });
    console.log('Pinger lambda is done');

    return;
};