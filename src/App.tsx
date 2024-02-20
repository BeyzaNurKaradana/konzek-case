import React, { useState, useEffect } from "react";
import "./App.css"; 


type Country = {
  code: string;
  name: string;
};

function App() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [groupTerm, setGroupTerm] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null); 

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    const response = await fetch("https://countries.trevorblades.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          {
            countries {
              code
              name
            }
          }
        `,
      }),
    });

    const { data } = await response.json();
    setCountries(data.countries);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleGroup = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupTerm(event.target.value === "none" ? null : event.target.value);
  };

  const handleSelectCountry = (code: string) => {
    setSelectedCountry(code === selectedCountry ? null : code); 
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCountries = groupTerm
    ? filteredCountries.reduce<{ [key: string]: Country[] }>(
        (groups, country) => {
          const groupKey = country[groupTerm];
          if (!groups[groupKey]) {
            groups[groupKey] = [];
          }
          groups[groupKey].push(country);
          return groups;
        },
        {}
      )
    : null;

  const selectDefaultCountry = () => {
    if (filteredCountries.length > 0) {
      const defaultIndex =
        filteredCountries.length <= 10 ? filteredCountries.length - 1 : 9;
      setSelectedCountry(filteredCountries[defaultIndex].code);
    }
  };

  useEffect(() => {
    selectDefaultCountry();
  }, [filteredCountries]);

  return (
    <div>
      <h1>Ülkeler</h1>
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearch}
      />
      <select onChange={handleGroup}>
        <option value="none">Group by...</option>
        <option value="code">Code</option>
        <option value="name">Name</option>
      </select>
      <ul>
        {groupedCountries
          ? Object.entries(groupedCountries).map(([group, countries]) => (
              <li key={group}>
                <strong>{group}</strong>
                <ul>
                  {countries.map((country) => (
                    <li
                      key={country.code}
                      onClick={() => handleSelectCountry(country.code)}
                      className={
                        selectedCountry === country.code ? "selected" : ""
                      }
                    >
                      {country.name} ({country.code})
                    </li>
                  ))}
                </ul>
              </li>
            ))
          : filteredCountries.map((country) => (
              <li
                key={country.code}
                onClick={() => handleSelectCountry(country.code)}
                className={selectedCountry === country.code ? "selected" : ""}
              >
                {country.name} ({country.code})
              </li>
            ))}
      </ul>
    </div>
  );
}

export default App;
