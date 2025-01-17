import { Typography } from "@material-ui/core";
import GroupCardList from "./GroupCardList";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userService } from "../services/user.service";
import { userActions } from '../actions/user.actions';

export default function MyGroupsPage() {
    const [groups, setGroups] = useState([])
    const userData = useSelector(state => state.user.user);
    const dispatch = useDispatch();
    const API_KEY = process.env.REACT_APP_API_KEY || '';

    const handleClickLeave = (eventId) => {
        if (userData && userData.data && userData.data._id) {
            dispatch(userActions.deleteGroup(userData.data._id, eventId));
        }
        setGroups(groups.filter(group => group.id !== eventId))
    }

    useEffect(() => {
        const data = []
        if (userData && userData.data && userData.data._id) {
            userService.getGroups(userData.data._id).then(async (userGroups) => {
                for (const eventID of userGroups) {
                    const response = await fetch('https://app.ticketmaster.com/discovery/v2/events/' + eventID + '.json?apikey=' + API_KEY)
                    // console.log(response.json())
                    const group = await response.json()
                    data.push(group)
                }
            }).then(_res => {
                setGroups(data)
            })
        }
    }, []);

    return (
        <div style={{ margin: "2em 10%", textAlign: "left" }}>
            <Typography variant="h1" style={{ margin: "1.5em .5em .5em .5em" }}>My Groups</Typography>
            <GroupCardList groups={groups ? groups : []} handleClickLeave={handleClickLeave} />
        </div>
    )
}