import 'dotenv/config';
import App from './App.svelte';

// Built thanks to 
// https://www.prisma.io/blog/build-an-app-with-svelte-and-typescript-PZDY3t93qAtd
// https://codechips.me/svelte-and-webpack-5/
const app = new App({
	target: document.body
});

export default app;