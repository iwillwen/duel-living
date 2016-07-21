<template>
  <div>
    <router-view transition="fade" transition-mode="out-in"></router-view>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        title: ''
      }
    },

    ready() {
      // Using events to update title
      this
        .$on('update-title', title => {
          if (title !== '') {
            document.title = `${title} - Duel Living`
          } else {
            document.title = 'Duel Living'
          }
        })
    }
  }
</script>