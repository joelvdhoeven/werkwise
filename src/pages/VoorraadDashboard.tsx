import React, { useState } from 'react';
import { Package, Box, TrendingDown, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Wrench, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSupabaseQuery } from '../hooks/useSupabase';

const VoorraadDashboard: React.FC = () => {
  const { hasPermission } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showLowStockDetails, setShowLowStockDetails] = useState(false);

  // Inventory data
  const { data: inventoryProducts = [] } = useSupabaseQuery<any>('inventory_products');
  const { data: inventoryStock = [] } = useSupabaseQuery<any>('inventory_stock');
  const { data: specialTools = [] } = useSupabaseQuery<any>('special_tools');

  // Combine inventory products with their stock levels
  const inventoryItems = inventoryProducts.map((product: any) => {
    const totalStock = inventoryStock
      .filter((stock: any) => stock.product_id === product.id)
      .reduce((sum: number, stock: any) => sum + parseFloat(stock.quantity || 0), 0);
    return {
      ...product,
      voorraad: totalStock,
      minimum_voorraad: product.minimum_stock,
      prijs: parseFloat(product.price || 0)
    };
  });

  const lowStockItems = inventoryItems.filter((item: any) => item.voorraad <= item.minimum_voorraad);
  const totalInventoryValue = inventoryItems.reduce((sum: number, item: any) => sum + (item.prijs || 0) * item.voorraad, 0);
  const availableTools = specialTools.filter((tool: any) => tool.status === 'beschikbaar');

  const COLORS = ['#DC2626', '#E11D48', '#F43F5E', '#FB7185', '#FECDD3', '#B91C1C', '#9F1239'];

  // Stock by category
  const stockByCategory = inventoryItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Overig';
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 };
    }
    acc[category].count += item.voorraad;
    acc[category].value += (item.prijs || 0) * item.voorraad;
    return acc;
  }, {});

  const categoryData = Object.entries(stockByCategory).map(([name, data]: [string, any]) => ({
    name,
    count: data.count,
    value: Math.round(data.value)
  }));

  if (!hasPermission('manage_settings')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Geen toegang tot voorraad dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Package size={28} className="text-red-600" />
            Voorraad Dashboard
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Overzicht van voorraad en gereedschap</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Totale Waarde</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>€{totalInventoryValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <Box className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Totaal Items</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{inventoryItems.length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/30' : 'bg-orange-50'}`}>
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lage Voorraad</p>
              <p className={`text-2xl font-bold text-orange-600`}>{lowStockItems.length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}>
              <Wrench className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Beschikbare Tools</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{availableTools.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category Bar Chart */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Voorraad per Categorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#DC2626" name="Aantal" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-[300px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Geen voorraad data beschikbaar
            </div>
          )}
        </div>

        {/* Value by Category Pie Chart */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Waarde per Categorie</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: €${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`flex items-center justify-center h-[300px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Geen voorraad data beschikbaar
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className={`rounded-xl border ${isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200'}`}>
          <button
            onClick={() => setShowLowStockDetails(!showLowStockDetails)}
            className={`w-full px-6 py-4 flex items-center justify-between transition-colors rounded-xl ${isDark ? 'hover:bg-orange-900/30' : 'hover:bg-orange-100'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-800/50' : 'bg-orange-200'}`}>
                <AlertTriangle className="h-5 w-5 text-orange-700" />
              </div>
              <div className="text-left">
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Low Stock Alerts</h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{lowStockItems.length} items onder minimum voorraad</p>
              </div>
            </div>
            {showLowStockDetails ? (
              <ChevronUp className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            ) : (
              <ChevronDown className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            )}
          </button>

          {showLowStockDetails && (
            <div className="px-6 pb-6">
              <div className={`rounded-lg border overflow-hidden ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-200'}`}>
                <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Product
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Huidige Voorraad
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Minimum
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Status
                      </th>
                      <th className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Waarde
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                    {lowStockItems.slice(0, 10).map((item: any) => (
                      <tr key={item.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Package className={`h-4 w-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <div>
                              <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.category || 'Algemeen'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm font-bold text-orange-600">{Math.floor(item.voorraad)} {item.unit}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.minimum_voorraad} {item.unit}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Kritiek
                          </span>
                        </td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          €{((item.prijs || 0) * item.voorraad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {lowStockItems.length > 10 && (
                  <div className={`px-4 py-3 border-t text-center ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      En nog {lowStockItems.length - 10} items meer...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {lowStockItems.length === 0 && (
        <div className={`rounded-xl border p-6 text-center ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'}`}>
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h4 className={`font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>Alle voorraad op peil!</h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Er zijn geen items met lage voorraad</p>
        </div>
      )}

      {/* Top Products by Value */}
      {inventoryItems.length > 0 && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Top 10 Producten op Waarde</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryItems
              .map((item: any) => ({
                name: item.name?.substring(0, 15) || 'Onbekend',
                waarde: (item.prijs || 0) * item.voorraad,
                voorraad: item.voorraad
              }))
              .sort((a: any, b: any) => b.waarde - a.waarde)
              .slice(0, 10)
            }>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: number, name: string) => {
                if (name === 'waarde') return `€${value.toFixed(2)}`;
                return value;
              }} />
              <Legend />
              <Bar dataKey="waarde" fill="#DC2626" name="Waarde (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default VoorraadDashboard;
