'use strict'

export function preview ({target}) {
    document.getElementById('preview-image')
            .src = URL.createObjectURL(target.files[0])
   
}

