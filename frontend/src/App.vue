<template>
  <div>
    <toaster></toaster>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Toaster from "./components/Toaster.vue";

@Component({
  components: {
    Toaster,
  },
})
export default class App extends Vue {
  mounted() {
    setTimeout(() => {
      const el = document.getElementById("intial-loader");
      if (el) {
        el.className = "animate__animated animate__fadeOut";
        setTimeout(() => {
          el.parentNode && el.parentNode.removeChild(el);
        }, 750);
      }
    }, 750);
  }
}
</script>

<style lang="scss">
@import "../node_modules/typeface-quicksand/index.css";

@import "~spectre.css/src/spectre.scss";

$material-design-icons-font-directory-path: "~material-design-icons-iconfont/dist/fonts/";
@import "~material-design-icons-iconfont/src/material-design-icons.scss";

@import "~animate.css/animate.css";

@import "./themes";

body {
  font-family: "Quicksand", sans-serif;
}

.material-icons {
  vertical-align: bottom;
}

.material-icons.mi-16 {
  font-size: 16px;
  vertical-align: middle;
}

.material-icons.mi-20 {
  font-size: 16px;
  vertical-align: middle;
}

.material-icons.mi-std {
  font-size: 20px;
  vertical-align: middle;
  margin-top: -4px;
}

.material-icons.mi-24 {
  font-size: 24px;
  vertical-align: middle;
}

.material-icons.mi-32 {
  font-size: 32px;
  vertical-align: middle;
}

.d-flex {
  display: flex;
}
.flex-grow,
.flex-grow-1 {
  flex-grow: 1 !important;
}
.hidden {
  display: none;
}

.flex-justify-center {
  justify-items: center;
}

.menu {
  min-width: 250px !important;
}
</style>
