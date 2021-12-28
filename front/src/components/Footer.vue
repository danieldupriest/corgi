<template>
  <footer>
    <div class="column">
      <h3>Application</h3>
      <p>
        This application was designed to be easily hosted using Google Cloud
        services.
      </p>
    </div>
    <div class="column">
      <h3>Implementation</h3>
      <p>Written by Daniel Dupriest.</p>
      <ul>
        <li>
          <a href="mailto:daniel.jon.dupriest@gmail.com"
            >daniel.jon.dupriest@gmail.com</a
          >
        </li>
        <li>
          <a href="https://www.linkedin.com/in/daniel-dupriest-76a495188/"
            >Linkedin</a
          >
        </li>
      </ul>
    </div>
    <div class="column">
      <h3>Code</h3>
      <p>
        Built using Javascript and <a href="https://vuejs.org/">Vue</a>. Project
        source code available under the
        <a href="https://opensource.org/licenses/MIT">MIT license</a>.
      </p>
      <ul>
        <li>
          <a href="https://github.com/danieldupriest/corgi">GitHub</a>
        </li>
      </ul>
    </div>
  </footer>
</template>

<script>
export default {
  name: "Footer",
};
</script>

<style scoped>
footer {
  background: var(--dark);
  box-shadow: 0 0 0.5em var(--shadow-dark);
  color: var(--bright);
  display: -webkit-flex;
  display: flex;
  -webkit-justify-content: space-between;
  justify-content: space-between;
  grid-gap: 2em;
  gap: 2em;
  line-height: 150%;
  padding: 3em 2em;
}

footer a {
  color: var(--brighter);
}
footer h3 {
  text-transform: uppercase;
}
</style>
