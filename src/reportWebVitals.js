const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;


























































/*
1) 
Type 1 Code : CRUD / Shipping / Banking
app.js
import { useState, useEffect } from 'react'
import axios from 'axios'


const API = 'http://localhost:5000'


export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [form, setForm] = useState({ name: '', items: '' })
  const [error, setError] = useState('')
  const [records, setRecords] = useState([])
  const [editId, setEditId] = useState(null)


  useEffect(() => {
    if (user) load()
  }, [user])


  const load = () =>
    axios.get(API + '/records').then((res) => setRecords(res.data))


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }


  const login = (e) => {
    e.preventDefault()
    const dummyUser = { name: form.name || 'User' }
    localStorage.setItem('user', JSON.stringify(dummyUser))
    setUser(dummyUser)
    setForm({ name: '', items: '' })
  }


  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.items) return setError('All fields required')
    if (form.items < 0 || form.items > 100) return setError('Items: 0-100 only')


    try {
      let res
      if (editId) {
        res = await axios.put(API + '/records/' + editId, form)
        setEditId(null)
      } else {
        res = await axios.post(API + '/submit', form)
      }
      setForm({ name: '', items: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.msg || 'Error')
    }
  }


  const edit = (r) => {
    setForm({ name: r.name, items: r.items })
    setEditId(r._id)
  }


  const del = async (id) => {
    if (!window.confirm('Delete this record?')) return
    await axios.delete(API + '/records/' + id)
    load()
  }


  const logout = () => {
    localStorage.clear()
    setUser(null)
  }


  const totalBill = records.reduce((sum, r) => sum + r.bill, 0)


  if (!user)
    return (
      <div style={s}>
        <h2>Login</h2>
        <form onSubmit={login}>
          <input name='name' placeholder='Your Name' onChange={handleChange} />
          <button>Login</button>
        </form>
      </div>
    )


  return (
    <div style={s}>
      <button onClick={logout} style={{ float: 'right' }}>
        Logout
      </button>
      <h2>{user.name}'s Dashboard</h2>


      <form onSubmit={submit}>
        <input
          name='name'
          placeholder='Name'
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name='items'
          type='number'
          placeholder='Items'
          value={form.items}
          onChange={handleChange}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button>{editId ? 'Update' : 'Add'}</button>
        {editId && (
          <button
            type='button'
            onClick={() => {
              setEditId(null)
              setForm({ name: '', items: '' })
            }}
          >
            Cancel
          </button>
        )}
      </form>


      <h3>All Records</h3>
      {records.length === 0 ? (
        <p>No records yet.</p>
      ) : (
        <>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 10,
            }}
          >
            <thead>
              <tr style={{ background: '#eee' }}>
                <th style={th}>Name</th>
                <th style={th}>Items</th>
                <th style={th}>Bill</th>
                <th style={th}>Date</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.items}</td>
                  <td style={td}>₹{r.bill}</td>
                  <td style={td}>{new Date(r.date).toLocaleString()}</td>
                  <td style={td}>
                    <button onClick={() => edit(r)} style={{ marginRight: 5 }}>
                      Edit
                    </button>
                    <button
                      onClick={() => del(r._id)}
                      style={{ background: 'red', color: 'white' }}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          <div
            style={{
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '1.2em',
            }}
          >
            Total Bill: ₹{totalBill}
          </div>
        </>
      )}
    </div>
  )
}


const s = {
  maxWidth: 800,
  margin: 'auto',
  padding: 20,
  fontFamily: 'sans-serif',
}
const th = { border: '1px solid #ccc', padding: 8, textAlign: 'left' }
const td = { border: '1px solid #ccc', padding: 8 }



server.js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())


mongoose.connect('mongodb://127.0.0.1:27017/examdb')


const RecordSchema = new mongoose.Schema({
  name: String,
  items: Number,
  bill: Number,
  date: { type: Date, default: Date.now },
})
const Record = mongoose.model('Record', RecordSchema)


// CREATE
app.post('/submit', async (req, res) => {
  const { name, items } = req.body
  if (!name || items == null) return res.status(400).json({ msg: 'Fill all' })
  if (items < 0 || items > 100)
    return res.status(400).json({ msg: 'Items 0-100' })


  const bill = items > 0 ? 500 + (items - 1) * 200 : 0
  const doc = new Record({ name, items, bill })
  await doc.save()
  res.json(doc)
})


// READ
app.get('/records', async (req, res) => {
  const data = await Record.find().sort({ date: -1 })
  res.json(data)
})


// UPDATE
app.put('/records/:id', async (req, res) => {
  const { name, items } = req.body
  if (!name || items == null) return res.status(400).json({ msg: 'Fill all' })
  if (items < 0 || items > 100)
    return res.status(400).json({ msg: 'Items 0-100' })


  const bill = items > 0 ? 500 + (items - 1) * 200 : 0
  const updated = await Record.findByIdAndUpdate(
    req.params.id,
    { name, items, bill },
    { new: true }
  )
  res.json(updated)
})


// DELETE
app.delete('/records/:id', async (req, res) => {
  await Record.findByIdAndDelete(req.params.id)
  res.json({ msg: 'deleted' })
})


app.listen(5000, () => console.log('Server running on http://localhost:5000'))












































2) 
Type 2 Code : Ecommerce / Inventory / Food : Login, add to cart, order
app.js 
import { useState, useEffect } from 'react'
import axios from 'axios'


const API = 'http://localhost:5000'


export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [loginName, setLoginName] = useState('')
  const [loginError, setLoginError] = useState('')
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState('shop')


  useEffect(() => {
    if (user) {
      axios
        .get(API + '/products')
        .then((res) => {
          setProducts(res.data)
          setLoading(false)
        })
        .catch(() => {
          setError('Failed to load products. Did you run /seed?')
          setLoading(false)
        })
    }
  }, [user])


  const handleLogin = (e) => {
    e.preventDefault()
    if (!loginName.trim()) return setLoginError('Name is required')
    if (loginName.length < 2) return setLoginError('Name too short')


    const newUser = { name: loginName.trim() }
    localStorage.setItem('user', JSON.stringify(newUser))
    setUser(newUser)
    setLoginName('')
    setLoginError('')
  }


  const logout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setCart([])
    setPage('shop')
  }


  const addToCart = (p) => setCart([...cart, p])
  const total = cart.reduce((s, i) => s + i.price, 0)


  const placeOrder = () => {
    setCart([])
    setPage('checkout')
  }


  if (page === 'checkout') {
    return (
      <div style={s}>
        <h2>Order Placed</h2>
        <p>Your order has been successfully placed!</p>
        <button
          onClick={() => {
            setPage('shop')
          }}
        >
          Back to Shop
        </button>
      </div>
    )
  }


  if (!user) {
    return (
      <div style={s}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            placeholder='Enter your name'
            value={loginName}
            onChange={(e) => {
              setLoginName(e.target.value)
              setLoginError('')
            }}
            style={{ width: '100%', padding: 8, margin: '8px 0' }}
          />
          {loginError && (
            <p style={{ color: 'red', margin: 0 }}>{loginError}</p>
          )}
          <button style={{ width: '100%', padding: 10 }}>Login</button>
        </form>
      </div>
    )
  }


  if (loading) return <div style={s}>Loading products...</div>
  if (error)
    return (
      <div style={s}>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    )


  return (
    <div style={s}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>Welcome, {user.name}!</h2>
        <button onClick={logout} style={{ padding: '5px 10px' }}>
          Logout
        </button>
      </div>


      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          marginTop: 20,
        }}
      >
        <div>
          <h3>Products</h3>
          {products.length === 0 ? (
            <p>
              No products.{' '}
              <a href={API + '/seed'} target='_blank'>
                Click to seed
              </a>
            </p>
          ) : (
            products.map((p) => (
              <div
                key={p._id}
                style={{ border: '1px solid #ccc', margin: 8, padding: 10 }}
              >
                <b>{p.name}</b> - ₹{p.price} <small>({p.category})</small>
                <button
                  onClick={() => addToCart(p)}
                  style={{ float: 'right', fontSize: 12 }}
                >
                  Add
                </button>
              </div>
            ))
          )}
        </div>


        <div>
          <h3>Cart ({cart.length})</h3>
          {cart.length === 0 ? (
            <p>Empty cart</p>
          ) : (
            <>
              {cart.map((c, i) => (
                <div key={i}>
                  • {c.name} - ₹{c.price}
                </div>
              ))}
              <h4>Total: ₹{total}</h4>
              <button
                onClick={placeOrder}
                style={{ width: '100%', marginTop: 10 }}
              >
                Checkout
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


const s = {
  maxWidth: 800,
  margin: 'auto',
  padding: 20,
  fontFamily: 'sans-serif',
}

server.js (first go to backend server/seed) 
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


const app = express()
app.use(cors({ origin: 'http://localhost:3000' }))
app.use(express.json())


mongoose.connect('mongodb://127.0.0.1:27017/examdb')


const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
})
const Product = mongoose.model('Product', ProductSchema)


app.get('/seed', async (req, res) => {
  await Product.deleteMany({})
  await Product.insertMany([
    { name: 'Laptop', price: 50000, category: 'Electronics' },
    { name: 'Shirt', price: 800, category: 'Clothing' },
    { name: 'Rice', price: 200, category: 'Groceries' },
  ])
  res.send('Seeded! Refresh React app.')
})


app.get('/products', async (req, res) => {
  const data = await Product.find()
  res.json(data)
})


app.listen(5000, () => {
  console.log('Backend → http://localhost:5000')
  console.log('Visit /seed ONCE → http://localhost:5000/seed')
})














































3)

Type 3 Code : Student / Validation
app.js 
import { useState } from 'react'
import axios from 'axios'


const API = 'http://localhost:5000'


export default function App() {
  const [form, setForm] = useState({ name: '', age: '', course: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')


  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }


  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.age || !form.course) return setError('All required')
    if (form.age < 18) return setError('Age must be 18+')


    try {
      await axios.post(API + '/register', form)
      setSuccess(`Registered for ${form.course}!`)
      setForm({ name: '', age: '', course: '' })
    } catch (err) {
      setError('Server error')
    }
  }


  return (
    <div style={s}>
      <h2>Course Registration</h2>
      <form onSubmit={submit}>
        <input
          name='name'
          placeholder='Name'
          value={form.name}
          onChange={handle}
          required
        />
        <input
          name='age'
          type='number'
          placeholder='Age'
          value={form.age}
          onChange={handle}
          required
        />
        <select name='course' value={form.course} onChange={handle} required>
          <option value=''>Select Course</option>
          <option>React</option>
          <option>Node.js</option>
          <option>MongoDB</option>
        </select>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button>Register</button>
      </form>
    </div>
  )
}


const s = {
  maxWidth: 400,
  margin: 'auto',
  padding: 20,
  fontFamily: 'sans-serif',
}

server.js
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


const app = express()
app.use(cors())
app.use(express.json())


mongoose.connect('mongodb://127.0.0.1:27017/examdb')


const RegSchema = new mongoose.Schema({
  name: String,
  age: Number,
  course: String,
  date: { type: Date, default: Date.now },
})
const Reg = mongoose.model('Registration', RegSchema)


app.post('/register', async (req, res) => {
  const { name, age, course } = req.body
  if (!name || !age || !course) return res.status(400).json({ msg: 'Fill all' })
  if (age < 18) return res.status(400).json({ msg: 'Age 18+' })


  const doc = new Reg({ name, age, course })
  await doc.save()
  res.json({ msg: 'Success' })
})


app.listen(5000, () => console.log('Server on 5000'))



*/



