import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import { DataContent } from './Data-content.jsx';

import { sync, addToQueue, queueTables, queryDB, readableTables } from '../../../utils/database';
import { sendNotification } from '../../../store/notifications/actions';

import NoEvents from '../../NoEvents';

const useStyles = makeStyles(theme => ({
	root: {
		// center everything
		display: 'flex',
		justifyContent: 'center',
	},
	content: {
		// set the content width so we have some padding
		// regardless of if the drawer is visible
		width: '90%',
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
}));

// map store to prop
function mapStateToProps(state) {
	return {
		user: state.user,
		template: state.template,
	};
};

function DataContainer(props) {
	const { user, template } = props;
	const classes = useStyles();

	const [ loaded, setLoaded ] = useState(false);

	const [ events, setEvents ] = useState([]);
	const [ selection, setSelection ] = useState({});
	const [ selectedEvent, setSelectedEvent ] = useState({});

	const [ runs, setRuns ] = useState([]);
	const [ pit, setPit ] = useState({});
	const [ processedTeam, setProcessedTeam ] = useState({});

	useEffect(() => {
		if (selection.event && selection.team) {
			queryDB(readableTables.RUNS, { event: selection.event, team: selection.team }).then(newRuns => {
				queryDB(readableTables.PROCESSED_TEAMS, { event: selection.event, team: selection.team }).then(newProcessed => {
					queryDB(readableTables.TEAMS, { event: selection.event, team: selection.team }).then(newTeams => {
						setRuns(newRuns);
						setProcessedTeam(newProcessed[0]);
						setPit(newTeams[0]);
					});
				});
			});
		}
	}, [selection]);

	// redirect to the login page if the user isn't logged in
	// this has to be put after hook calls or else react errors
	if (process.env.NODE_ENV === 'production' && !user.loggedin) return <Redirect to={"/login"} />;

	/**
	 * Update a team's pit doc
	 * @param {string} event The event key
	 * @param {number} team The team number
	 * @param {{}} data The new team doc
	 */
	const updatePit = (event, team, data) => {
		// store the team doc to local db
		addToQueue(queueTables.TEAMS, {team: team, event: event, data: data}).then(() => {
			// on successful store
			// async sync data with the server
			sync(user.session.token).then(() => {
				// notification on success
				props.dispatch(sendNotification({
					variant: 'success',
					text: 'Updated data!'
				}));
			}, e => {
				// error handling
				// log to console and notify the user
				console.error('failed to sync pits ', e);
				props.dispatch(sendNotification({
					variant: 'error',
					text: 'Failed to sync data!'
				}));
			});
		}, e => {
			// error handling
			// log to console and notify the user
			console.error('failed to save pit ', e);
			props.dispatch(sendNotification({
				variant: 'error',
				text: 'Failed to store data!'
			}));
		});
	};

	/**
	 * Select an event and set team if the current team isn't in the event
	 * @param {string} event the event code
	 */
	const selectEvent = (eventKey) => {
		// narrow down to events with this key (should be one and only one)
		const filteredEvents = events.filter(event => event.key === eventKey);
		// if we didn't find any events just quit
		if (filteredEvents.length < 1) return;

		// select the first match (again, should only be one)
		const event = filteredEvents[0];
		// if the event doesn't have any teams quit
		if (event.teams.length < 1) return;

		// if this event has the team we have selected, keep it, else pick the first team listed
		const team = event.teams.includes(selection.team) ? selection.team : event.teams[0];
		// set the selected event
		setSelectedEvent(event);
		// set our selection
		setSelection({ ...selection, event: eventKey, team: team });
		return { ...selection, event: eventKey, team: team };
	};
	/**
	 * Select a team if it's available
	 * @param {number} team the team number
	 */
	const selectTeam = (team) => {
		// if the current event has this team, set it, else default to the first team in the event
		const newTeam = selectedEvent.teams.includes(team) ? team : selectEvent.teams[0];
		if (!selectedEvent.teams.includes(team)) console.warn('current event doesn\'t have team ' + team + '\nDefaulting to team ' + newTeam);

		// set our selection
		setSelection({ ...selection, team: newTeam });
	};

	/**
	 * Get the currently occuring event from an array of events
	 * 
	 * Returns the most recent event if there isn't an active event, or the first if none have passed
	 * @param {[]} events array of events to get the current event from
	 */
	const getCurrentEvent = (givenEvents) => {
		// if there aren't any events quit
		if (givenEvents.length < 1) return;
		// get all started events
		const startedEvents = givenEvents.filter(event => event.startDate < Date.now()).sort((a, b) => a.startDate - b.startDate);
		// if there aren't any started events or we only have one event overall, return the first event
		if (startedEvents.length === 0 || givenEvents.length === 1) return givenEvents[0];
		// else return the most recent
		return startedEvents[startedEvents.length - 1];
	};

	if (!loaded) {
		if (process.env.NODE_ENV === 'production') {
			queryDB(readableTables.EVENTS).then(newEvents => {
				setEvents(newEvents);
				// select the current event from our newly read events
				selectEvent(getCurrentEvent(newEvents).key);
				setLoaded(true);
			});
		} else {
			setLoaded(true);
		}
	}

	if (!loaded) return <React.Fragment />;

	if (events.length < 1) return <NoEvents />;

	return (
		<div className={classes.root}>
			{true &&
				<DataContent
				template={template}
				events={events}

				processedTeam={processedTeam}
				runs={runs.sort((a, b) => a.match - b.match)}
				pit={pit}

				updatePit={updatePit}
				selectEvent={selectEvent}
				selectTeam={selectTeam}

				selection={selection}
				currentEvent={selectedEvent}
				/>
			}
		</div>
	);
};

export default connect(mapStateToProps)(DataContainer);