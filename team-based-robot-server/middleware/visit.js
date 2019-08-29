/* eslint-disable */
export default async function({ store }) {
  await Promise.all([
    store.dispatch("fetchProfile"),
    store.dispatch("fetchFeature"),
  ])
  return true
}
/* eslint-enable */
