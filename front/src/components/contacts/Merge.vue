<template>
  <div>
    <h2>Merge Contacts</h2>
    <div v-if="duplicates">
      <p>
        The following duplicate contacts require manual merging. If you wish to
        combine the contacts, select which value (existing or new) you wish to
        use for every field, then click "Save". To leave a contact unchanged,
        click "Ignore".
      </p>
      <table
        :class="{ 'styled-table': true, hidden: hideDuplicates[dupIndex] }"
        v-for="(duplicate, dupIndex) in duplicates"
        :key="dupIndex"
      >
        <thead>
          <tr>
            <th></th>
            <th class="overwrite-header">Overwrite</th>
            <th>New data</th>
            <th></th>
            <th>Existing data</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(field, fieldIndex) in duplicate.fields"
            :key="fieldIndex"
            :class="{ different: field.different }"
          >
            <th
              :class="{
                'field-name-cell': true,
                resolved: overwrites[dupIndex][field.name],
              }"
            >
              {{ field.pretty_name }}
            </th>
            <td class="overwrite-cell">
              <input
                v-if="field.different"
                type="checkbox"
                v-model="overwrites[dupIndex][field.name]"
              />
            </td>
            <td class="new-data-field">{{ field.newData }}</td>
            <td>
              <span v-if="overwrites[dupIndex][field.name]" class="arrow"
                >→</span
              >
            </td>
            <td v-if="overwrites[dupIndex][field.name]">
              {{ field.newData }}
            </td>
            <td v-else>
              {{ field.existingData }}
            </td>
          </tr>
          <tr>
            <td colspan="5">
              <button
                @click="save(duplicate.newId, duplicate.existingId, dupIndex)"
              >
                <strong>Save</strong>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No duplicates found.</p>
    </div>
  </div>
</template>

<script>
const axios = require("axios");

export default {
  name: "Merge",
  data() {
    return {
      duplicates: null,
      hideDuplicates: [],
      mergeId: null,
      overwrites: [],
    };
  },
  methods: {
    async save(newId, existingId, index) {
      const url = `${process.env.VUE_APP_BASE_URL}/api/contacts/upload/${this.mergeId}/overwrite/${existingId}/with/${newId}`;
      const data = {
        overwrites: this.overwrites[index],
      };
      const result = await axios.post(url, data);
      if (result.status != 200) {
        return console.error(`Unexpected status code: ${result.status}`);
      }
      this.hideDuplicates[index] = true;
    },
    load() {
      const url =
        process.env.VUE_APP_BASE_URL +
        "/api/contacts/upload/" +
        this.mergeId +
        "/duplicates";
      axios
        .get(url)
        .then((res) => {
          if (res.status != 200) {
            return console.error(`Unexpected status code.`);
          }
          this.duplicates = res.data.duplicates;
          for (const duplicate of this.duplicates) {
            let plan = {};
            for (const field of duplicate.fields) {
              if (field.different) {
                plan[field.name] = false;
              }
            }
            this.overwrites.push(plan);
            this.hideDuplicates.push(false);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
  computed: {
    filteredDuplicates() {
      const result = this.duplicates.filter((_, index) => {
        return this.hideDuplicates[index] == false;
      });
      return result;
    },
  },
  mounted() {
    this.mergeId = this.$route.params.mergeId;
    this.load();
  },
};
</script>/

<style scoped>
.hidden {
  display: none;
}
.different .field-name-cell:after {
  background: red;
  border-radius: 25px;
  color: white;
  content: "different";
  display: block;
  font-weight: normal;
  margin: 0.5rem 0 0 0;
  padding: 0.125rem 0.25rem;
  text-align: center;
}
.different .field-name-cell.resolved:after {
  display: none;
}
.field-name-cell {
  text-align: left;
}
.overwrite-header {
  font-weight: normal;
}
.overwrite-cell {
  text-align: center;
}
.arrow {
  font-size: 150%;
}
</style>
