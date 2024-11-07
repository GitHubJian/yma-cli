import VConsole from 'vconsole';

const search = window.location.search;
const params = new URLSearchParams(search);
const vconsole = params.get('vconsole');

if (vconsole === 'true') {
    window.VConsole = VConsole;
    window.vConsole = new VConsole();
}
