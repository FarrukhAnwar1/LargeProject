import React, { useState } from 'react';
import { buildPath } from '../utils/Path';
import { retrieveToken, storeToken } from '../utils/TokenStorage';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function CarsUI() {
    const navigate = useNavigate();
    const [message, ] = useState('');
    const [searchResults, setResults] = useState('');
    const [cardList, setCardList] = useState('');
    const [search, setSearchValue] = React.useState('');
    // Currently commented out since JWT is not returned to frontend and is only stored as a cookie
    // const _ud = localStorage.getItem('user_data');
    // const ud = JSON.parse(String(_ud));
    // const userId = ud.userId;
    
    async function addCar(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();
        navigate('/cars/add');
    };

    async function searchCard(e: React.MouseEvent<HTMLButtonElement>): Promise<void> {
        e.preventDefault();
        const obj = { search: search, jwtToken: retrieveToken() };
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
    return (
        <div id="cardUIDiv">
            <br />
            Search: <input type="text" id="searchText" placeholder="Card To Search For"
                onChange={handleSearchTextChange} />
            <button type="button" id="searchCardButton"
                onClick={searchCard}> Search Card</button><br />
            <span id="cardSearchResult">{searchResults}</span>
            <p id="cardList">{cardList}</p><br /><br />
            <button type="button" id="addCarButton"
                onClick={addCar}> Add Car </button><br />
            <span id="carAddResult">{message}</span>
        </div>
    );
}
export default CarsUI;