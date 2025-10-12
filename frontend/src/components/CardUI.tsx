import React, { useState } from 'react';
import { buildPath } from './Path';
import { retrieveToken, storeToken } from '../tokenStorage';
import axios from 'axios';
function CardUI() {
    const [message, setMessage] = useState('');
    const [searchResults, setResults] = useState('');
    const [cardList, setCardList] = useState('');
    const [search, setSearchValue] = React.useState('');
    const [card, setCardNameValue] = React.useState('');
    const _ud = localStorage.getItem('user_data');
    const ud = JSON.parse(String(_ud));
    const userId = ud.userId;
    // var firstName = ud.firstName;
    // var lastName = ud.lastName;
    async function addCard(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();
        const obj = { userId: userId, card: card, jwtToken: retrieveToken() };
        const js = JSON.stringify(obj);
        const config = {
            method: 'post',
            url: buildPath('api/addcard'),
            headers:
            {
                'Content-Type': 'application/json'
            },
            data: js
        };
        axios(config).then(function (response) {
            const res = response.data;
            if (res.error.length > 0) {
                setMessage("API Error:" + res.error);
            }
            else {
                setMessage('Card has been added');
                storeToken(res.jwtToken);
            }
        }).catch(function (error) {
            setMessage(error.toString());
        });
    };
    async function searchCard(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();
        const obj = { userId: userId, search: search, jwtToken: retrieveToken() };
        const js = JSON.stringify(obj);
        const config = {
            method: 'post',
            url: buildPath('api/searchcards'),
            headers:
            {
                'Content-Type': 'application/json'
            },
            data: js
        };
        axios(config).then(function (response) {
            const res = response.data;
            const _results = res.results;
            let resultText = '';
            for (let i = 0; i < _results.length; i++) {
                resultText += _results[i];
                if (i < _results.length - 1) {
                    resultText += ', ';
                }
            }
            setResults('Card(s) have been retrieved');
            storeToken(res.jwtToken);
            setCardList(resultText);
        }).catch(function (error) {
            alert(error.toString());
            setResults(error.toString());
        });
    };
    function handleSearchTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setSearchValue(e.target.value);
    }
    function handleCardTextChange(e: React.ChangeEvent<HTMLInputElement>): void {
        setCardNameValue(e.target.value);
    }
    return (
        <div id="cardUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Card To Search For"
                onChange={handleSearchTextChange} />
            <button type="button" id="searchCardButton" className="buttons"
                onClick={searchCard}> Search Card</button><br />
            <span id="cardSearchResult">{searchResults}</span>
            <p id="cardList">{cardList}</p><br /><br />
            Add: <input type="text" id="cardText" placeholder="Card To Add"
                onChange={handleCardTextChange} />
            <button type="button" id="addCardButton" className="buttons"
                onClick={addCard}> Add Card </button><br />
            <span id="cardAddResult">{message}</span>
        </div>
    );
}
export default CardUI;