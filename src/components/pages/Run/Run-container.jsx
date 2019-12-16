import React, { useState } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { sendNotification } from '../../../store/notifications/actions';

import { Run } from './Run-content.jsx';
import { SetupDialog } from './Run-SetupDialog.jsx';

function mapStateToProps(state) {
	return {
		user: state.user,
		notification: state.notification,
		template: state.template,
	};
};

export function RunContainer(props) {
	const [ matchStatus, setMatchStatus ] = useState({
		started: false,
		completed: false,
		loadoutShown: false
	});

	const [ dialogs, setDialogs ] = useState({
		setupDialog: true,
		finalizeDialog: false
	});

	const [ runState, setRunState ] = useState({
		team: '',
		match: '',
		position: '',
		journal: [],
		notes: '',
	});

	// redirect to the login page if the user isn't logged in
	if (process.env.NODE_ENV === 'production' && !props.user.loggedin) return <Redirect to={"/login"} />;

	const startMatch = () => {
		setDialogs({ ...dialogs, setupDialog: false });
		setMatchStatus({ ...matchStatus, started: true });
	};

	const endMatch = () => {
		setDialogs({ ...dialogs, finalizeDialog: true });
		setMatchStatus({ ...matchStatus, completed: true });
	};

	return (
		<React.Fragment>
			<Run
			template={props.template}
			totalTime={150}
			matchStatus={matchStatus}
			setMatchStatus={setMatchStatus}
			runState={runState}
			setRunState={setRunState}
			afterMatch={endMatch}
			/>
			<SetupDialog
			open={dialogs.setupDialog}
			template={props.template}
			startMatchAction={startMatch}
			runState={runState}
			setRunState={setRunState}
			/>
		</React.Fragment>
	);
};

export default connect(mapStateToProps)(RunContainer);