const addStar = document.querySelectorAll('.addStar')

Array.from(addStar).forEach(function(element) {
    element.addEventListener('click', function(){
      const name = this.parentNode.parentNode.childNodes[1].innerText
      const msg = this.parentNode.parentNode.childNodes[3].innerText
      const thumbUp = parseFloat(this.parentNode.parentNode.childNodes[5].innerText)
  
      fetch('intinerary', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          'name': name,
          'msg': msg,
          'thumbUp':thumbUp,
        })
      })
      .then(response => {
        if (response.ok) return response.json()
      })
      .then(data => {
        console.log(data)
        window.location.reload(true)
      })
    });
  });