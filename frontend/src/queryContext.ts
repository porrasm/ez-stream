import React from 'react'

type QueryContextType = {
    getUrlParam: (key: string) => string | undefined
    setUrlParam: (key: string, value: string | undefined) => void
    delete: (key: string) => void
    getQueryString: () => string
}

export const defaultQueryContext: QueryContextType = {
    getUrlParam: (key) => parseQuery(window.location.search).get(key),
    setUrlParam: (key, value) => {
        const params = parseQuery(window.location.search)
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        setUrlParams(params)
    },
    delete: (key) => {
        const params = parseQuery(window.location.search)
        params.delete(key)
        setUrlParams(params)
    },
    getQueryString: () => window.location.search
}

export function parseQuery(queryString: string) {
    var query = new Map<string, string>();
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
    }
    return query;
}

const setUrlParams = (params: Map<string, string>) => {
    params.delete("")
    // delete each empty param
    params.forEach((val, key) => {
        if (val === "") {
            params.delete(key)
        }
    })

    const search = new URLSearchParams(Object.fromEntries(params)).toString()
    window.history.pushState({}, "", `?${search}`)
}

export const useQueryContext = () => React.useContext(QueryContext)

export const QueryContext = React.createContext(
    defaultQueryContext
)
