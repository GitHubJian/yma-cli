import {useReducer} from 'react';

// 强制组件重新渲染
function useUpdate() {
    const [, update] = useReducer(num => num + 1, 0);

    return update;
}

export default useUpdate;
