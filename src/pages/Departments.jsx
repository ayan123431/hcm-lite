import SimpleCrud from '../components/SimpleCrud'

export default function Departments() {
  return <SimpleCrud title="Departments" col="departments" fields={[{ name: 'name', label: 'Department name' }]} />
}