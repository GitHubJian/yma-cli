import useWindowLockScroll from './useWindowLockScroll';

export default function useWindowBodyLockScroll() {
    return useWindowLockScroll(document.body);
}
