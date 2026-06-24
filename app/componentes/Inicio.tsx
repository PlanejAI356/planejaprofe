type InicioProps = {
  onComecar: () => void;
};

export default function Inicio({ onComecar }: InicioProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold mb-6">📚 PlanejAI</h1>

        <p className="text-lg mb-6">
          Vamos criar seu planejamento de aula?
        </p>

        <button
          onClick={onComecar}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold cursor-pointer"
        >
          COMEÇAR
        </button>
      </div>
    </div>
  );
}