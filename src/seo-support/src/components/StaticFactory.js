import React from 'react';

export default function StaticFactory(Component){
	return class StaticComponent extends React.Component {
		shouldComponentUpdate(nextProps, nextState){
			return false;
		}

		render(){
			return <Component {...this.props} />
		}
	};
}