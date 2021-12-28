<template>
  <div>
    <header>
      <h1 id="logo"><router-link to="/">CORGI</router-link></h1>
      <div id="subtext">Community Organizer for Grassroots Initiatives</div>
      <nav id="navigation">
        <router-link to="/">Home</router-link>&nbsp;
        <router-link to="/contacts">Contacts</router-link>&nbsp;
        <router-link to="/contacts/upload">Upload</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script>
import Footer from "./components/Footer.vue";
export default {
  name: "App",
  components: { Footer },
};
</script>

<style>
:root {
  --accent: #009879;
  --brighter: #e2e2e2;
  --bright: #a4a4a4;
  --dark: #2a2a2a;
  --darker: #666666;
  --darkest: #121212;
}
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
}
a {
  text-decoration: none;
}
header a:hover {
  border-bottom: 2px solid white;
}
header {
  background: var(--dark);
  color: #ffffff;
  display: flex;
  align-items: center;
  padding: 1rem;
  justify-content: space-between;
}
header a {
  color: #ffffff;
}
#logo {
  margin: 0;
  background: -webkit-linear-gradient(rgb(247, 236, 223), rgb(173, 133, 1));
  background-clip: border-box;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
#subtext {
  color: var(--bright);
  flex-grow: 1;
  margin: 0 1rem;
}
#navigation {
  align-self: center;
}
main {
  margin: 0 1rem 2rem 1rem;
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
button + button {
  margin-left: 1rem;
}
ul {
  padding-left: 1rem;
}
</style>
