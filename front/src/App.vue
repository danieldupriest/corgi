<template>
  <div>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/contacts">Contacts</router-link> |
      <router-link to="/contacts/upload">Upload</router-link>
    </div>
    <router-view />
  </div>
</template>

<style>
:root {
  --accent: #009879;
}
body {
  font-family: sans-serif;
  margin: 0 1rem;
  padding: 0;
}
table {
  border: 0;
  border-collapse: collapse;
}
td {
  border: 0;
}
.styled-table {
  margin: 1rem 0;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.styled-table thead tr {
  background-color: var(--accent);
  color: #ffffff;
  text-align: left;
}
.styled-table th,
.styled-table td {
  padding: 0.8rem 1rem;
}
.styled-table tbody tr {
  border-bottom: 1px solid #dddddd;
}
.styled-table tbody tr:nth-of-type(even) {
  background-color: #f3f3f3;
}
.styled-table tbody tr:last-of-type {
  border-bottom: 2px solid #009879;
}
</style>
