export default function ({ $axios }) {
  $axios.onRequest(config => {
    const { method, url, headers } = config
    const { Authorization } = headers.common
    const isAuthorization = !!Authorization
    console.log(`[Axios] ${method.toUpperCase()} <- ${url} [${isAuthorization}]`)
  })

  $axios.onResponse(response => {
    const { config } = response
    const { url, baseURL } = config
    const urlTarget = url.replace(baseURL, "")
    console.log(`[Axios] RESPONSE -> ${urlTarget}`)
  })

  $axios.onError(error => {
    const { data: { errors } } = error.response
    console.error("[Axios] Error -> ", errors)
  })
}
