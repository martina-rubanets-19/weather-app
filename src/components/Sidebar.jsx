import { useState } from "react";



export default function Sidebar({ cities, selectedCityId, onSelectCity, onAddCity }) {

const [inputValue, setInputValue] = useState("");



const handleSubmit = (e) => {

e.preventDefault();

if (inputValue.trim()) {

onAddCity(inputValue);

setInputValue("");

}

};



return (

<aside className="sidebar">

<div className="sidebarHeader">

<h1 className="appTitle">Weather</h1>

</div>



{/* */}

<form onSubmit={handleSubmit} className="searchForm">

<div className="searchWrapper">

<span className="searchIcon">🔍</span>

<input

type="text"

className="searchInput"

placeholder="Пошук міста..."

value={inputValue}

onChange={(e) => setInputValue(e.target.value)}

/>

</div>

</form>



<div className="sidebarSectionTitle">Міста</div>



<ul className="cityList">

{cities.map((c) => {

const isActive = c.id === selectedCityId;

return (

<li key={c.id}>

<button

type="button"

className={`cityItem ${isActive ? "active" : ""}`}

onClick={() => onSelectCity(c.id)}

>

<span className="cityName">{c.name}</span>

<span className="cityMeta">{c.country}</span>

</button>

</li>

);

})}

</ul>

</aside>

);

} 