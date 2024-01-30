import { GithubUser } from './GithubUser.js'

// 2 classes
// 1 classe contendo a lógica e organizando os dados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)

    //Iniciar com o app rodando a função load para carregar a lista na sequência vai para o FavoritesView rodando o update
    this.load()
  }

  load() {
    const entries = JSON.parse(
      localStorage.getItem('@github-favorites:') || '[]'
    )

    console.log('Load Ok')

    this.entries = entries
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      // Verificando antes de ir para o github se o usuário já existe no banco de dados
      const userExists = this.entries.find(entry => entry.login === username)
      console.log(userExists)

      if (userExists) {
        throw new Error('Usuário já favoritado!')
      }

      const user = await GithubUser.search(username)
      // console.log(user)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  //--- Deletando o usuário e atualizando a tabela com os novos valores

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    // console.log(filteredEntries)

    this.entries = filteredEntries
    console.log(this.entries)
    this.update()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')
      // console.log(value)
      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector('.user img').src = `
      https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('tem certeza que deseja deletar essa linha?')
        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  //--- Criando as linhas

  createRow() {
    const tr = document.createElement('tr')

    const content = `
    <td class="user">
    <img
    src="https://github.com/RCysne.png"
    alt="Imagem de Ronaldo Cysne"
    />
    <a href="https://github.com/RCysne" target="_blank">
    <p>Ronaldo Cysne</p>
    <span>RCysne</span>
    </a>
    </td>
    <td class="repositories">50</td>
    <td class="followers">10</td>
    <td>
    <button class="remove">&times;</button>
    </td>
    `

    tr.innerHTML = content

    // console.log(tr)
    return tr
  }

  removeAllTr() {
    // const tbody = this.root.querySelector('table tbody')

    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
