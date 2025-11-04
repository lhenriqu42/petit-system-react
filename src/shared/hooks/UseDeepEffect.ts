import { useEffect } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';



export const useDeepEffect = (callback: React.EffectCallback, dependencies: React.DependencyList | undefined) => {
	const objs = dependencies?.filter(dep => typeof dep === 'object' && dep !== null) || [];
	// const literals = dependencies?.filter(dep => typeof dep !== 'object' || dep === null) || [];
	if (objs.length > 0) {
		useDeepCompareEffect(callback, dependencies);
	} else {
		useEffect(callback, dependencies);
	}
}