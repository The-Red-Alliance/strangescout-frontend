import React from 'react';
import { connect } from 'react-redux';

import { createInvite } from '../../../store/invite/actions';

import { Redirect } from 'react-router-dom';

// import content
import { Invite } from './Invite-content.jsx';

// map store to prop
function mapStateToProps(state) {
	return {
		user: state.user,
		invite: state.invite
	};
};

function InviteContainer(props) {
	// redirect to the home page if the user can't invite
	if (process.env.NODE_ENV === 'production' && !props.user.invite) return <Redirect to={"/"} />;

	function action(inviteData) {
		props.dispatch(createInvite(props.user.session.token, inviteData));
	};

	return (
		<Invite admin={props.user.session.admin} invite={props.invite} inviteAction={action} />
	);
};

export default connect(mapStateToProps)(InviteContainer);