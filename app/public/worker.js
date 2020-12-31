onmessage = ({ data }) => {
    // const {
    //     memory,
    //     config: { x, y, d }
    // } = data;

    fetch("asset-manifest.json")
        .then(response => response.json())
        .then(res => {
            for(let file of Object.keys(res.files)) {
                if (file.endsWith(".wasm"))
                    fetch(file)
                        .then(res => res.arrayBuffer())
                        .then(bytes => WebAssembly.instantiate(bytes, {
                            env: {
                                memory
                            }
                        }))
            }
        })

    // fetch("mandlbrot.wasm")
    //     .then(response => response.arrayBuffer())
    //     .then(bytes =>
    //         WebAssembly.instantiate(bytes, {
    //             env: {
    //                 memory
    //             }
    //         })
    //     )
    //     .then(({ instance }) => {
    //         instance.exports.run(x, y, d, id);
    //         postMessage("done");
    //     });
};