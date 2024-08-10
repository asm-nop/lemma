import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="bg-orange-300 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lemma</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:text-blue-200">Home</a></li>
            <li><a href="#" className="hover:text-blue-200">Theorems</a></li>
            <li><a href="#" className="hover:text-blue-200">Submit Proof</a></li>
            <li><a href="#" className="hover:text-blue-200">Connect Wallet</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header